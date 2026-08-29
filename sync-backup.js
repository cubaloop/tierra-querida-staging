import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = "https://vqspnxgjsnvrwjaohccu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3BueGdqc252cndqYW9oY2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NzU1OTgsImV4cCI6MjEwMDQ1MTU5OH0.LwXVlpOaHwwZ5gpv4jZfTjbnJihH0xcifAK3W8mbjXc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function backup() {
  try {
    console.log("Fetching latest data from Supabase...");
    const { data: dishes } = await supabase.from("dishes").select("*").order("created_at", { ascending: true });
    const { data: promos } = await supabase.from("promotions").select("*").order("created_at", { ascending: true });
    const { data: info } = await supabase.from("restaurant_info").select("*").eq("id", "default").maybeSingle();

    if (!dishes || !promos || !info) {
      throw new Error("Could not fetch data from Supabase. Make sure tables are populated.");
    }

    const mappedDishes = dishes.map(d => ({
      id: d.id,
      name: d.name,
      price: Number(d.price),
      category: d.category,
      description: d.description || "",
      image: d.image || "",
      tags: d.tags ? d.tags.split(",").map(t => t.trim()) : [],
      optionsTitle: d.options_title || "",
      optionsChoices: d.options_choices || ""
    }));

    const mappedPromos = promos.map(p => ({
      id: p.id,
      text: p.text,
      image: p.image || ""
    }));

    const mappedInfo = {
      name: info.name,
      phone: info.phone,
      whatsappLink: info.whatsapp_link,
      address: info.address,
      email: info.email || "info@tierraqueridadubai.com",
      instagram: info.instagram,
      tiktok: info.tiktok,
      facebook: info.facebook
    };

    const fileContent = `// Archivo de Datos Iniciales Generado desde el Dashboard
// Tierra Querida Restaurant - Dubai

export const RESTAURANT_INFO = ${JSON.stringify(mappedInfo, null, 2)};

export const CATEGORIES = [
  { id: "desayunos", name: "Desayunos", subtitle: "Breakfast Classics" },
  { id: "entradas", name: "Entradas", subtitle: "Small Plates & Starters" },
  { id: "fuertes", name: "Almuerzos Especiales", subtitle: "Colombian Specialty Mains" },
  { id: "bowls", name: "Bowls", subtitle: "Customizable Bowls" },
  { id: "arepas", name: "Arepas", subtitle: "Traditional Stuffed Corn Cakes" },
  { id: "comidas-rapidas", name: "Comidas Rápidas", subtitle: "Latin Street Food" },
  { id: "promos", name: "Promos", subtitle: "Empanada Packages" },
  { id: "saludable", name: "Saludable", subtitle: "Balanced & Healthy Plates" },
  { id: "ensaladas", name: "Ensaladas", subtitle: "Fresh Salads" },
  { id: "salchipapas", name: "Salchipapas", subtitle: "Loaded Fries Platter" },
  { id: "adicionales", name: "Adicionales", subtitle: "Extras & Sides" },
  { id: "bebidas", name: "Bebidas", subtitle: "Drinks & Refreshments" }
];

export const INITIAL_DISHES = ${JSON.stringify(mappedDishes, null, 2)};

export const INITIAL_PROMOTIONS = ${JSON.stringify(mappedPromos, null, 2)};
`;

    const outputPath = path.resolve("src/data/initialData.js");
    fs.writeFileSync(outputPath, fileContent, "utf-8");
    console.log("Success! Backup file generated at:", outputPath);
  } catch (err) {
    console.error("Backup failed:", err);
  }
}

backup();
