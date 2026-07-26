import Link from "next/link";
import { Arrow } from "../../components/Icons";

const faqGroups = [
  {
    title: "Orders & delivery",
    questions: [
      {
        question: "When will my order be processed?",
        answer:
          "TACT processes orders within two business days, Monday to Friday excluding holidays. Tracking information is shared after dispatch.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Standard shipping generally takes 3–4 business days. Expedited shipping generally takes 1–3 business days. Carrier delays can affect these estimates.",
      },
      {
        question: "Is shipping free?",
        answer:
          "Orders over ₹499 qualify for free standard shipping within India. Other shipping costs are shown at checkout.",
      },
    ],
  },
  {
    title: "Returns & exchanges",
    questions: [
      {
        question: "Can I return an item?",
        answer:
          "Eligible items may be returned within seven days of delivery. They must be unworn, unwashed, in original condition, and have all tags attached. Sale items are excluded unless otherwise stated.",
      },
      {
        question: "How much does a return cost?",
        answer:
          "Customers are responsible for return shipping and each return incurs a ₹125 fee, except when an incorrect or damaged item was received.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "After the returned item is received and inspected, TACT sends the refund to the original payment method. It can take up to 10 business days to appear.",
      },
      {
        question: "Can I exchange for another size or colour?",
        answer:
          "Yes, when stock is available and the item meets the same eligibility requirements as a return.",
      },
    ],
  },
  {
    title: "Products & payment",
    questions: [
      {
        question: "How do I choose a size?",
        answer:
          "Use the garment size guide on each product page and compare it with a piece you already own. For styling or fit help, contact the TACT team before ordering.",
      },
      {
        question: "Is there a prepaid offer?",
        answer:
          "TACT currently offers an extra 5% off eligible prepaid orders. The final saving is confirmed at checkout.",
      },
      {
        question: "How can I get help with an order?",
        answer:
          "Email info@tactlifestyle.store or call +91 98937 89469 with your order number.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main id="main" className="inner-main faq-page">
      <header className="faq-hero">
        <p className="kicker">TACT / Help</p>
        <h1>Questions, answered.</h1>
        <p>
          Everything important about ordering, delivery, returns and sizing.
        </p>
      </header>

      <div className="faq-layout">
        <aside className="faq-index">
          <p>On this page</p>
          {faqGroups.map((group, index) => (
            <a href={`#faq-${index + 1}`} key={group.title}>
              {String(index + 1).padStart(2, "0")} / {group.title}
            </a>
          ))}
          <Link href="/pages/contact">
            Still need help? <Arrow />
          </Link>
        </aside>

        <div className="faq-groups">
          {faqGroups.map((group, groupIndex) => (
            <section id={`faq-${groupIndex + 1}`} key={group.title}>
              <div className="faq-group-heading">
                <small>{String(groupIndex + 1).padStart(2, "0")}</small>
                <h2>{group.title}</h2>
              </div>
              <div className="faq-questions">
                {group.questions.map((item, index) => (
                  <details open={groupIndex === 0 && index === 0} key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
