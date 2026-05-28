import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

import man1 from "@/assets/feedbacks/man1.jpg"
import man2 from "@/assets/feedbacks/man2.jpg"
import man3 from "@/assets/feedbacks/man3.jpeg"
import woman1 from "@/assets/feedbacks/woman1.jpeg"
import woman2 from "@/assets/feedbacks/woman2.jpeg"

const testimonials = [
    {
        id: 1,
        name: "Kasun Perera",
        role: "Badminton Player",
        rating: 5,
        quote:
            "KVK Arena provides excellent badminton facilities with enough space and professional standards.",
        image: man3,
    },
    {
        id: 2,
        name: "Dilini Apsara",
        role: "Undergraduate Student",
        rating: 5,
        quote:
            "The café at KVK Arena is cozy, modern, and perfect for spending quality time.",
        image: woman1,
    },
    {
        id: 3,
        name: "Dasun Shyaminda",
        role: "Software Developer",
        rating: 4,
        quote:
            "I played a lot of games at KVK Games and every visit was full of fun, excitement, and unforgettable memories.",
        image: man2,
    },
    {
        id: 4,
        name: "Janika Chathuni",
        role: "Badminton Player",
        rating: 5,
        quote:
            "KVK Arena has one of the best badminton courts I’ve played on. Clean, spacious, and professional!",
        image: woman2,
    },
    {        
        id: 5,
        name: "Dulhan Rajitha",
        role: "Gym Athlete",
        rating: 5,
        quote:
            "KVK Gym completely changed my fitness routine. The trainers are supportive, the equipment is modern, and the environment keeps me motivated every day.",
        image: man1,
    },
]

export default function Feedbacks() {
    const [activeIndex, setActiveIndex] = useState(0)

    const goToPrevious = () => {
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    const goToNext = () => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            goToNext()
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const activeTestimonial = testimonials[activeIndex]

    return (
        <section className="relative overflow-hidden bg-[#f5f5f5] py-14 lg:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="mx-auto max-w-3xl text-center">
                    <h2 data-aos="fade-up" className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-linear-to-r from-[#000000] via-[#2d86fc] to-[#2d86fc] bg-clip-text text-transparent">
                        What Our Clients Say
                    </h2>

                    <p data-aos="fade-up" data-aos-delay="100" className="mt-4 text-base text-slate-500">
                        From intense workouts and competitive matches to relaxing cafe
                        moments, KVK Arena is built to deliver comfort, quality, and
                        unforgettable experiences for every visitor.
                    </p>
                </div>

                {/* Avatar Row */}
                <div className="mt-12 flex items-center justify-center gap-3 sm:gap-5">
                    {testimonials.map((item, index) => {
                        const isActive = index === activeIndex

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveIndex(index)}
                                className={`relative overflow-hidden rounded-full transition-all duration-500 ${isActive
                                        ? "h-20 w-20 sm:h-24 sm:w-24 scale-110 shadow-[0_15px_40px_rgba(0,0,0,0.18)]"
                                        : "h-12 w-12 sm:h-14 sm:w-14 opacity-80 grayscale"
                                    }`}
                            >
                                <img
                                    data-aos="fade-up"
                                    data-aos-delay={`${index * 100}`}
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover rounded-full"
                                />

                                {isActive && (
                                    <div className="absolute inset-0 rounded-full ring-4 ring-white" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="relative mt-14 flex items-center justify-center">
                    {/* Left Arrow */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:scale-105 lg:flex"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Testimonial */}
                    <div className="mx-auto max-w-4xl text-center">
                        <p data-aos="fade-up" data-aos-delay="200" className="text-lg leading-8 text-slate-700 sm:text-xl sm:leading-9">
                            “{activeTestimonial.quote}”
                        </p>
                        

                        <div className="mt-4 flex items-center justify-center gap-1.5" data-aos="fade-up" data-aos-delay="250">
                            {Array.from({ length: 5 }).map((_, starIndex) => {
                                const filled = starIndex < activeTestimonial.rating

                                return (
                                    <Star
                                        key={starIndex}
                                        size={18}
                                        className={filled ? "fill-[#296BE1] text-[#296BE1]" : "text-slate-300"}
                                    />
                                )
                            })}
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-4" data-aos="fade-up" data-aos-delay="250">
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                {activeTestimonial.name}
                            </h3>

                            <div className="h-7 w-px bg-slate-300" />

                            <p className="text-base text-slate-500">
                                {activeTestimonial.role}
                            </p>
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={goToNext}
                        className="absolute right-0 z-10 hidden h-11 w-11 items-center justify-center rounded-full bg-[#296BE1] text-white shadow-[0_10px_30px_rgba(41,107,225,0.28)] transition hover:scale-105 lg:flex"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Mobile Arrows */}
                <div className="mt-10 flex items-center justify-center gap-4 lg:hidden">
                    <button
                        onClick={goToPrevious}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        onClick={goToNext}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#296BE1] text-white shadow-[0_10px_30px_rgba(41,107,225,0.28)]"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    )
}