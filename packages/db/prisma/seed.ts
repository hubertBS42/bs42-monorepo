import { prisma } from "../src/client.js"
import { scrypt } from "@noble/hashes/scrypt.js"
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js"
import { env } from "prisma/config"

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
  // Clear database
  // await prisma.invitation.deleteMany()
  // await prisma.member.deleteMany()
  // await prisma.organization.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  // await prisma.activity.deleteMany()

  console.log("Database cleared")

  // Create Global workspace first
  // const globalWorkspace = await prisma.organization.create({
  // 	data: {
  // 		name: 'Global',
  // 		slug: 'global',
  // 	},
  // })

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

  // SuperAdmin is member of Global workspace
  // await prisma.member.create({
  // 	data: {
  // 		userId: superAdmin.id,
  // 		organizationId: globalWorkspace.id,
  // 		role: 'owner',
  // 	},
  // })

  console.log("Seed complete")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
