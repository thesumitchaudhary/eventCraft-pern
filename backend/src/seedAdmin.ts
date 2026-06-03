import { prisma } from "./libs/prisma";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;

async function adminSeed() {
    try {
        if (!ADMIN_EMAIL || !ADMIN_PASS) {
            throw new Error("Missing ADMIN_EMAIL or ADMIN_PASS");
        }

        let user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

        if (!user) {
            const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);

            user = await prisma.user.create({
                data: {
                    firstname: "Chaudhary",
                    lastname: "Sumit",
                    email: ADMIN_EMAIL,
                    password: hashedPassword,
                    role: "ADMIN",
                    verified_at: new Date(),
                },
            });

            console.log("Admin user created:", user.email);
        } else {
            console.log("Admin user already exists:", user.email);
        }

        const existingAdmin = await prisma.admin.findFirst({
            where: { userId: user.id },
        });

        if (!existingAdmin) {
            await prisma.admin.create({
                data: {
                    userId: user.id,
                    phone: 0,
                },
            });
        }

        console.log("Admin record synced");
    } catch (error) {
        console.log("seed error:", error?.message ?? error);
    } finally {
        await prisma.$disconnect();
    }
}

adminSeed().catch((e) => {
    console.error("Uncaught seed error", e);
    process.exit(1);
});