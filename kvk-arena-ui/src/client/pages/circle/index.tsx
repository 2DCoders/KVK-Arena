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

const images = [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10];

export default function Circle() {
    return (
        <div className="banner">
            <div className="slider" style={{ "--quantity": images.length } as React.CSSProperties}>
                {images.map((imgSrc, index) => (
                    <div
                        className="item"
                        key={index}
                        style={{ "--position": index + 1 } as React.CSSProperties}
                    >
                        <img src={imgSrc} alt={`Dragon ${index + 1}`} />
                    </div>
                ))}
            </div>
            <div className="content">
                <h1 data-content="">KVK ARENA GYM</h1>
                <div className="model"></div>
            </div>
        </div>
    );
}
