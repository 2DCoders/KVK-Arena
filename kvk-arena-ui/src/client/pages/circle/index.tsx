import d1 from "@/assets/circle/dragon_1.jpg";
import d2 from "@/assets/circle/dragon_2.jpg";
import d3 from "@/assets/circle/dragon_3.jpg";
import d4 from "@/assets/circle/dragon_4.jpg";
import d5 from "@/assets/circle/dragon_5.jpg";
import d6 from "@/assets/circle/dragon_6.jpg";
import d7 from "@/assets/circle/dragon_7.jpg";
import d8 from "@/assets/circle/dragon_8.jpg";
import d9 from "@/assets/circle/dragon_9.jpg";
import d10 from "@/assets/circle/dragon_10.jpg";
import model from "@/assets/circle/model.png";
import "@/client/styles/styles.css";

const cards = [
  {
    image: d1,
    title: "Strength Training",
    subtitle: "Build Power & Muscle",
  },
  {
    image: d2,
    title: "Cardio Zone",
    subtitle: "Improve Endurance",
  },
  {
    image: d3,
    title: "Badminton",
    subtitle: "Professional Courts",
  },
  {
    image: d4,
    title: "Gaming Arena",
    subtitle: "Ultimate Experience",
  },
  {
    image: d5,
    title: "Car Wash",
    subtitle: "Premium Detailing",
  },
  {
    image: d6,
    title: "Fitness Classes",
    subtitle: "Train Together",
  },
  {
    image: d7,
    title: "Recovery",
    subtitle: "Rest & Recharge",
  },
  {
    image: d8,
    title: "Nutrition",
    subtitle: "Healthy Lifestyle",
  },
  {
    image: d9,
    title: "Personal Coach",
    subtitle: "Expert Guidance",
  },
  {
    image: d10,
    title: "KVK Arena",
    subtitle: "Train Like A Champion",
  },
];

export default function Circle() {
  return (
    <div className="banner">
      <div
        className="slider"
        style={{ "--quantity": cards.length } as React.CSSProperties}
      >
        {cards.map((card, index) => (
          <div
            className="item"
            key={index}
            style={{ "--position": index + 1 } as React.CSSProperties}
          >
            <div className="gym-card">
              <img src={card.image} alt={card.title} />

              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="model" aria-hidden="true">
        <img src={model} alt="KVK Arena model" />
      </div>

      <div className="content">
        <h1>KVK ARENA</h1>
      </div>
    </div>
  );
}