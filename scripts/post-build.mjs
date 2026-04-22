import { cpSync, existsSync, mkdirSync, rmSync, renameSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

// eslint-disable-next-line no-undef
const root = process.cwd()
const distDir = join(root, 'dist')

// Find all app directories that have .next/standalone
const findApps = () => {
	const apps = []
	const appsDir = join(root, 'apps')

	if (!existsSync(appsDir)) return apps

	const appFolders = readdirSync(appsDir)

	for (const app of appFolders) {
		const standalonePath = join(appsDir, app, '.next', 'standalone')
		if (existsSync(standalonePath)) {
			apps.push({
				name: app,
				path: join(appsDir, app),
				standalonePath,
			})
		}
	}

	return apps
}

const apps = findApps()

if (apps.length === 0) {
	console.error('No apps with standalone output found. Make sure output: "standalone" is set in next.config.ts for each app')
	// eslint-disable-next-line no-undef
	process.exit(1)
}

console.log(`Found ${apps.length} app(s): ${apps.map(a => a.name).join(', ')}`)

// Clean previous dist
if (existsSync(distDir)) {
	console.log('Cleaning previous dist...')
	rmSync(distDir, { recursive: true, force: true })
}

mkdirSync(distDir, { recursive: true })

// Process each app
for (const app of apps) {
	console.log(`\n📦 Processing ${app.name}...`)

	const standaloneDir = app.standalonePath
	const appDistDir = join(distDir, app.name)

	const appStandalonePath = join(standaloneDir, 'apps', app.name)

	if (!existsSync(appStandalonePath)) {
		console.error(`  ❌ Could not find standalone path for ${app.name} at ${appStandalonePath}`)
		continue
	}

	console.log(`  Copying standalone output...`)
	// Copy the entire standalone directory (including node_modules)
	cpSync(standaloneDir, appDistDir, { recursive: true })

	// Now move apps/app-name to the root of appDistDir
	const sourcePath = join(appDistDir, 'apps', app.name)
	const filesToMove = readdirSync(sourcePath)

	console.log(`  Restructuring output (moving ${app.name} contents to root)...`)
	for (const file of filesToMove) {
		const source = join(sourcePath, file)
		const destination = join(appDistDir, file)

		// Remove destination if it exists
		if (existsSync(destination)) {
			rmSync(destination, { recursive: true, force: true })
		}

		// Move the file/directory
		renameSync(source, destination)
	}

	// Remove the now-empty apps directory
	rmSync(join(appDistDir, 'apps'), { recursive: true, force: true })

	// Copy static assets from .next/static to the correct location in the dist
	const nextStaticSrc = join(app.path, '.next', 'static')
	const nextStaticDest = join(appDistDir, '.next', 'static')
	if (existsSync(nextStaticSrc)) {
		console.log(`  Copying static assets...`)
		mkdirSync(join(appDistDir, '.next'), { recursive: true })
		cpSync(nextStaticSrc, nextStaticDest, { recursive: true })
	}

	// Copy public folder
	const publicSrc = join(app.path, 'public')
	const publicDest = join(appDistDir, 'public')
	if (existsSync(publicSrc)) {
		console.log(`  Copying public folder...`)
		cpSync(publicSrc, publicDest, { recursive: true })
	}

	// DO NOT remove node_modules - it's needed for standalone!
	// The node_modules folder contains bundled dependencies including 'next'

	// Verify server.js exists
	const serverJsPath = join(appDistDir, 'server.js')
	if (!existsSync(serverJsPath)) {
		console.error(`  ❌ server.js not found in ${appDistDir}`)
	} else {
		console.log(`  ✅ server.js found`)
	}

	// Verify node_modules/next exists
	const nextModulePath = join(appDistDir, 'node_modules', 'next')
	if (!existsSync(nextModulePath)) {
		console.warn(`  ⚠️  Warning: node_modules/next not found - app may not run properly`)
	} else {
		console.log(`  ✅ node_modules/next found`)
	}
}

// Copy .env (if exists)
const envSrc = join(root, '.env')
const envDest = join(distDir, '.env')
if (existsSync(envSrc)) {
	console.log('\n📄 Copying .env...')
	cpSync(envSrc, envDest, { recursive: true })
} else {
	console.log('\n⚠️  No .env file found, skipping...')
}

// Generate ecosystem.config.cjs with all apps
console.log('\n🚀 Generating ecosystem.config.cjs...')

const ecosystemApps = apps.map(app => ({
	name: `att-crms-${app.name}`,
	script: `./${app.name}/server.js`,
	node_args: '--env-file=.env',
}))

const ecosystem = `module.exports = {
  apps: [
${ecosystemApps
	.map(
		app => `    {
      name: '${app.name}',
      script: '${app.script}',
      node_args: "${app.node_args}",
      watch: false,
      autorestart: true,
      restart_delay: 3000
    },`,
	)
	.join('\n')}
  ],
}
`

writeFileSync(join(distDir, 'ecosystem.config.cjs'), ecosystem)

console.log('\n✅ Post-build complete!')
console.log('\n📁 Expected dist structure:')
console.log('dist/')
apps.forEach((app, index) => {
	const isLast = index === apps.length - 1
	console.log(`  ${isLast ? '└──' : '├──'} ${app.name}/`)
	console.log(`      ├── server.js`)
	console.log(`      ├── .next/`)
	console.log(`      │   └── static/`)
	console.log(`      ├── public/`)
	console.log(`      └── node_modules/  ← Contains next and other bundled deps`)
})
console.log(`  ├── .env`)
console.log(`  └── ecosystem.config.cjs  ← PM2 config`)

// Verify the structure
console.log('\n🔍 Verifying build output...')
for (const app of apps) {
	const appDir = join(distDir, app.name)
	const serverJs = join(appDir, 'server.js')
	const nextDir = join(appDir, '.next')
	const publicDir = join(appDir, 'public')
	const nextModule = join(appDir, 'node_modules', 'next')

	console.log(`\n${app.name}:`)
	console.log(`  ${existsSync(serverJs) ? '✅' : '❌'} server.js`)
	console.log(`  ${existsSync(nextDir) ? '✅' : '❌'} .next/`)
	console.log(`  ${existsSync(publicDir) ? '✅' : '❌'} public/`)
	console.log(`  ${existsSync(nextModule) ? '✅' : '❌'} node_modules/next`)
}
