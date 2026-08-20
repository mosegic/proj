import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12);

  const user = await db.user.upsert({
    where: { email: "demo@menusaas.com" },
    update: {},
    create: {
      name: "Demo Owner",
      email: "demo@menusaas.com",
      passwordHash,
      restaurants: {
        create: {
          name: "Demo Cafe",
          slug: "demo-cafe",
          description: "A cozy cafe with artisan coffee and fresh pastries",
          themeColor: "#2563eb",
          accentColor: "#1e40af",
          categories: {
            create: [
              {
                name: "Coffee",
                description: "Freshly brewed specialty coffee",
                sortOrder: 1,
                items: {
                  create: [
                    {
                      name: "Espresso",
                      description: "Rich and bold single shot",
                      price: 3.5,
                      sortOrder: 1,
                    },
                    {
                      name: "Cappuccino",
                      description: "Espresso with steamed milk foam",
                      price: 4.75,
                      sortOrder: 2,
                    },
                    {
                      name: "Latte",
                      description: "Smooth espresso with steamed milk",
                      price: 5.25,
                      sortOrder: 3,
                    },
                  ],
                },
              },
              {
                name: "Pastries",
                description: "Baked fresh daily",
                sortOrder: 2,
                items: {
                  create: [
                    {
                      name: "Croissant",
                      description: "Buttery, flaky French croissant",
                      price: 3.95,
                      sortOrder: 1,
                    },
                    {
                      name: "Blueberry Muffin",
                      description: "Loaded with fresh blueberries",
                      price: 3.5,
                      sortOrder: 2,
                    },
                  ],
                },
              },
              {
                name: "Lunch",
                description: "Light bites and sandwiches",
                sortOrder: 3,
                items: {
                  create: [
                    {
                      name: "Avocado Toast",
                      description: "Sourdough, smashed avocado, cherry tomatoes, feta",
                      price: 12.5,
                      sortOrder: 1,
                      imageUrl:
                        "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop",
                    },
                    {
                      name: "Club Sandwich",
                      description: "Turkey, bacon, lettuce, tomato on toasted bread",
                      price: 14.0,
                      sortOrder: 2,
                      isSoldOut: true,
                    },
                  ],
                },
              },
            ],
          },
          tables: {
            create: [
              { label: "Table 1", tableNumber: 1 },
              { label: "Table 2", tableNumber: 2 },
              { label: "Patio A", tableNumber: 3 },
            ],
          },
        },
      },
    },
  });

  console.log("Seeded demo data:");
  console.log("  Email: demo@menusaas.com");
  console.log("  Password: demo1234");
  console.log("  Menu: /menu/demo-cafe");
  console.log("  User ID:", user.id);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
