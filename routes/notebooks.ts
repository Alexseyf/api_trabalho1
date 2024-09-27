import { Processador, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

const noteSchema = z.object({
  modelo: z.string(),
  marca: z.string(),
  processador: z.nativeEnum(Processador).optional(),
  preco: z.number(),
  quantidade: z.number(),
});

// Lista todos os notebooks

router.get("/", async (req, res) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        modelo: true,
        marca: true,
        preco: true,
        quantidade: true,
        processador: true,
      },
    });
    res.status(200).json(notebooks);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

// Cadastra um novo notebook

router.post("/", async (req, res) => {
  const valida = noteSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  try {
    const note = await prisma.notebook.create({
      data: {
        ...valida.data,
        processador: valida.data.processador as Processador,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Remove um notebook pelo id

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const notebook = await prisma.notebook.delete({
      where: { id: Number(id) },
    });
    res.status(200).json(notebook);
  } catch (error) {
    res.status(400).json({ erro: error });
  }
});

// Altera cadastro de um notebook pelo id

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const valida = noteSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  try {
    const notebook = await prisma.notebook.update({
      where: { id: Number(id) },
      data: valida.data,
    });
    res.status(201).json(notebook);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Lista marca modelo e preço em ordem crescente de preço

router.get("/listaprecos", async (req, res) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      orderBy: { preco: "asc" },
      select: {
        marca: true,
        modelo: true,
        preco: true,
      },
    });
    res.status(200).json(notebooks);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

// Lista preço médio dos notebooks e a soma da quantidade

router.get("/media", async (req, res) => {
  try {
    const notebooks = await prisma.notebook.aggregate({
      _avg: {
        preco: true,
      },
      _sum: {
        quantidade: true,
      },
    });
    res.status(200).json(notebooks);
  } catch (error) {
    res.status(500).json({ erro: error });
  }
});

// Filtra produtos por marca e preço recebendo como parâmetro a marca e o preço máximo

router.get("/pesquisa/:marca/:preco", async (req, res) => {
  const { marca, preco } = req.params
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { marca: { contains: marca } , preco: { lte: Number(preco) } }
    })
    res.status(200).json(notebooks)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

// Listar marcas e quantidade de notebooks agrupado por marca

router.get("/marcas", async (req, res) => {
  try {
    const notebooks = await prisma.notebook.groupBy({
      by: ["marca"],
      _sum: {
        quantidade: true,
      }
    })
    res.status(200).json(notebooks)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router;
