import d1 from "@/assets/circle/d1.png";
import d2 from "@/assets/circle/d2.png";
import d3 from "@/assets/circle/d3.png";
import d4 from "@/assets/circle/d4.png";
import d5 from "@/assets/circle/d5.png";
import d6 from "@/assets/circle/d6.png";
import d7 from "@/assets/circle/d7.png";
import d8 from "@/assets/circle/d8.png";
import d9 from "@/assets/circle/d9.png";
import d10 from "@/assets/circle/d10.png";
import model from "@/assets/circle/model.png";
import "@/client/styles/styles.css";

const cards = [
    {
        image: d1,
        title: "Bench Press",
        subtitle: "Heavy compound movement for chest and triceps",
        category: "Fitness",
    },
    {
        image: d2,
        title: "Dumbbell Curl",
        subtitle: "Biceps isolation exercise for arm strength",
        category: "Fitness",
    },
    {
        image: d3,
        title: "Cardio",
        subtitle: "High-intensity training to improve endurance",
        category: "Fitness",
    },
    {
        image: d4,
        title: "Incline Bench Press",
        subtitle: "Upper-chest focused pressing with controlled motion",
        category: "Fitness",
    },
    {
        image: d5,
        title: "Back Press",
        subtitle: "Targets posterior deltoids and upper back",
        category: "Fitness",
    },
    {
        image: d6,
        title: "Front Press",
        subtitle: "Develops anterior shoulders and core stability",
        category: "Fitness",
    },
    {
        image: d7,
        title: "One-Arm Rowing",
        subtitle: "Builds lats and unilateral pulling strength",
        category: "Fitness",
    },
    {
        image: d8,
        title: "Dumbbell Curl",
        subtitle: "Focus on biceps peak and controlled reps",
        category: "Fitness",
    },
    {
        image: d9,
        title: "Dumbbell Fly",
        subtitle: "Opens the chest and increases pec stretch",
        category: "Fitness",
    },
    {
        image: d10,
        title: "Lat Pull Down",
        subtitle: "Strengthens lats for improved pulling power",
        category: "Fitness",
    },
];

export default function Circle() {
    return (
        <div className="banner">
            <div className="slider"
                style={{ "--quantity": cards.length } as React.CSSProperties}
            >
                {cards.map((card, index) => (
                    <div
                        className="item"
                        key={index}
                        style={{ "--position": index + 1 } as React.CSSProperties}
                    >
                        <div className="gym-card">
                            {card.category && (
                                <div className="card-pill">{card.category}</div>
                            )}
                            <img src={card.image} alt={card.title} />

                            <div className="image-overlay">
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