export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex-1 p-8">
      <h1 className="text-2xl font-semibold">Order {id}</h1>
      <p className="mt-2 text-sm text-neutral-500">Order details coming soon.</p>
    </main>
  );
}
