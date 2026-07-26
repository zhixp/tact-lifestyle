import { notFound } from "next/navigation";
import { ProductPurchase } from "../../components/ProductPurchase";
import { products } from "../../data";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export function generateStaticParams() {
  return products.map((product) => ({ handle: product.handle }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = products.find((item) => item.handle === handle);

  if (!product) notFound();

  const recommendations = products
    .filter(
      (item) =>
        item.handle !== product.handle &&
        (item.category === product.category ||
          item.collections.some((collection) =>
            product.collections.includes(collection),
          )),
    )
    .slice(0, 4);

  if (recommendations.length < 4) {
    recommendations.push(
      ...products
        .filter(
          (item) =>
            item.handle !== product.handle &&
            !recommendations.some(
              (recommendation) => recommendation.handle === item.handle,
            ),
        )
        .slice(0, 4 - recommendations.length),
    );
  }

  return (
    <main id="main" className="inner-main product-main">
      <ProductPurchase
        product={product}
        recommendations={recommendations}
      />
    </main>
  );
}
