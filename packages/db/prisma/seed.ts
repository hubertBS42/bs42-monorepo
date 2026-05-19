import { prisma } from "../src/client.js"
import { scrypt } from "@noble/hashes/scrypt.js"
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js"
import { env } from "prisma/config"
import { brands, categories } from "../constants.js"

const hashPassword = async (password: string): Promise<string> => {
  const salt = bytesToHex(randomBytes(16))
  const key = scrypt(password.normalize("NFKC"), salt, {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
  })
  return `${salt}:${bytesToHex(key)}`
}

async function main() {
  const [globalWorkspace, defaultWorkspace] = await Promise.all([
    prisma.organization.create({
      data: {
        name: "Global",
        slug: "global",
      },
    }),
    prisma.organization.create({
      data: {
        name: "BS42.NET",
        slug: "bs42-net",
      },
    }),
  ])

  // Create superAdmin (you)
  const superAdmin = await prisma.user.create({
    data: {
      name: env("SEED_SUPERADMIN_NAME"),
      email: env("SEED_SUPERADMIN_EMAIL"),
      emailVerified: true,
      role: "superAdmin",
    },
  })

  const hashedPassword = await hashPassword(env("SEED_SUPERADMIN_PASSWORD"))

  await prisma.account.create({
    data: {
      userId: superAdmin.id,
      accountId: superAdmin.id,
      providerId: "credential",
      password: hashedPassword,
    },
  })

  // Make SuperAdmin member of Global and Default workspaces
  await Promise.all([
    prisma.member.create({
      data: {
        userId: superAdmin.id,
        organizationId: globalWorkspace.id,
        role: "owner",
      },
    }),
    prisma.member.create({
      data: {
        userId: superAdmin.id,
        organizationId: defaultWorkspace.id,
        role: "owner",
      },
    }),
  ])

  console.log("✅ Superadmin, Global workspace and Default workspace created.")

  // Seed categories
  console.log("\n📂 Seeding categories...")
  const createdCategories = new Map()

  // Insert root categories first (parentRef is undefined)
  for (const category of categories) {
    if (!category.parentRef) {
      const created = await prisma.category.create({
        data: {
          name: category.name,
          slug: "",
          description: category.description,
          image: category.image,
          isFeatured: category.isFeatured,
          status: category.status,
        },
      })
      createdCategories.set(category.ref, created.id)
      console.log(`  ✓ Created root category: ${category.name}`)
    }
  }

  // Insert child categories
  for (const category of categories) {
    if (category.parentRef) {
      const parentId = createdCategories.get(category.parentRef)
      if (!parentId) {
        throw new Error(`❌ Parent reference ${category.parentRef} not found for category ${category.name}`)
      }

      const created = await prisma.category.create({
        data: {
          name: category.name,
          slug: "",
          description: category.description,
          image: category.image,
          isFeatured: category.isFeatured,
          parentId,
          status: category.status,
        },
      })
      createdCategories.set(category.ref, created.id)
      console.log(`  ✓ Created category: ${category.name} (parent: ${category.parentRef})`)
    }
  }

  console.log(`\n✅ Successfully seeded ${createdCategories.size} categories`)

  // Seed brands
  console.log("\n🏷️ Seeding brands...")

  for (const brand of brands) {
    await prisma.brand.create({
      data: {
        name: brand.name,
        slug: "",
        website: brand.website,
        logo: brand.logo,
        description: brand.description,
        status: brand.status,
        isFeatured: brand.isFeatured,
      },
    })
    console.log(`  ✓ Created brand: ${brand.name}`)
  }
  console.log(`\n✅ Successfully seeded ${brands.length} brands`)
  console.log("\n🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
