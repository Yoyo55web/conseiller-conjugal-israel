import { listPublicFeedback } from "@/lib/db";

export default async function Testimonials() {
  const testimonials = await listPublicFeedback();
  if (testimonials.length === 0) return null;
  return (
    <section className="border-y border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold text-green-800">Retours authentiques</p>
        <h2 className="mt-2 text-2xl font-semibold">Ce que l’accompagnement leur a apporté</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <figure key={`${item.author}-${index}`} className="rounded-2xl border bg-white p-6">
              <div aria-label={`${item.rating} étoiles sur 5`} className="text-amber-500">{"★".repeat(item.rating)}<span className="text-gray-300">{"★".repeat(5 - item.rating)}</span></div>
              <blockquote className="mt-4 leading-relaxed text-gray-700">“{item.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-gray-900">{item.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
