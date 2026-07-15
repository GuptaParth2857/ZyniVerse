import { prisma } from "./prisma";

interface FigureInput {
  name: string;
  anime?: string;
  manufacturer?: string;
  scale?: string;
  price?: number;
  currency?: string;
  purchaseDate?: string;
  image?: string;
  condition?: string;
  isForSale?: boolean;
}

interface FigureStats {
  totalFigures: number;
  totalValue: number;
  currency: string;
  byAnime: { anime: string; count: number }[];
  byCondition: { condition: string; count: number }[];
  byManufacturer: { manufacturer: string; count: number }[];
  recentAdditions: number;
}

export async function getFigureCollection(userId: string) {
  return prisma.figureCollection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function addFigure(userId: string, input: FigureInput) {
  return prisma.figureCollection.create({
    data: {
      userId,
      name: input.name,
      anime: input.anime || null,
      manufacturer: input.manufacturer || null,
      scale: input.scale || null,
      price: input.price || null,
      currency: input.currency || "INR",
      purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      image: input.image || null,
      condition: input.condition || "new",
      isForSale: input.isForSale || false,
    },
  });
}

export async function updateFigure(
  userId: string,
  figureId: string,
  input: Partial<FigureInput>
) {
  const figure = await prisma.figureCollection.findFirst({
    where: { id: figureId, userId },
  });

  if (!figure) throw new Error("Figure not found");

  return prisma.figureCollection.update({
    where: { id: figureId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.anime !== undefined && { anime: input.anime }),
      ...(input.manufacturer !== undefined && { manufacturer: input.manufacturer }),
      ...(input.scale !== undefined && { scale: input.scale }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.purchaseDate !== undefined && {
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
      }),
      ...(input.image !== undefined && { image: input.image }),
      ...(input.condition !== undefined && { condition: input.condition }),
      ...(input.isForSale !== undefined && { isForSale: input.isForSale }),
    },
  });
}

export async function deleteFigure(userId: string, figureId: string) {
  const figure = await prisma.figureCollection.findFirst({
    where: { id: figureId, userId },
  });

  if (!figure) throw new Error("Figure not found");

  await prisma.figureCollection.delete({ where: { id: figureId } });
}

export async function getFigureStats(userId: string): Promise<FigureStats> {
  const figures = await prisma.figureCollection.findMany({
    where: { userId },
  });

  const currencyTotals = new Map<string, number>();
  for (const f of figures) {
    if (f.price) {
      const cur = f.currency || "INR";
      currencyTotals.set(cur, (currencyTotals.get(cur) || 0) + f.price);
    }
  }
  const dominantCurrency = figures[0]?.currency || "INR";
  const totalValue = currencyTotals.get(dominantCurrency) || 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentAdditions = await prisma.figureCollection.count({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const animeMap = new Map<string, number>();
  const conditionMap = new Map<string, number>();
  const manufacturerMap = new Map<string, number>();

  for (const f of figures) {
    if (f.anime) animeMap.set(f.anime, (animeMap.get(f.anime) || 0) + 1);
    conditionMap.set(f.condition, (conditionMap.get(f.condition) || 0) + 1);
    if (f.manufacturer)
      manufacturerMap.set(f.manufacturer, (manufacturerMap.get(f.manufacturer) || 0) + 1);
  }

  return {
    totalFigures: figures.length,
    totalValue,
    currency: dominantCurrency,
    byAnime: Array.from(animeMap.entries())
      .map(([anime, count]) => ({ anime, count }))
      .sort((a, b) => b.count - a.count),
    byCondition: Array.from(conditionMap.entries())
      .map(([condition, count]) => ({ condition, count }))
      .sort((a, b) => b.count - a.count),
    byManufacturer: Array.from(manufacturerMap.entries())
      .map(([manufacturer, count]) => ({ manufacturer, count }))
      .sort((a, b) => b.count - a.count),
    recentAdditions,
  };
}
