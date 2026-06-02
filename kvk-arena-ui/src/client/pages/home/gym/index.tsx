import GymHeader from "@/components/header/gym";
import GymHero from "../../hero/gym";
import Circle from "../../circle";
import GymStepper from "../../gym-stepper";
import Memberships from "../../memberships";
import FAQ from "../../faq";
import { useLayoutEffect } from "react";

export default function GymHome() {

    useLayoutEffect(() => {
        document.documentElement.scrollTop = 0
        window.scrollTo({ top: 0, behavior: "instant" })
    }, []);

    return (
        <>
            <GymHeader />
            <GymHero />
            <GymStepper />
            <Memberships />
            <Circle />
            <FAQ />
        </>
    )
}