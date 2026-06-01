import GymHeader from "@/components/header/gym";
import GymHero from "../../hero/gym";
import Circle from "../../circle";
import GymStepper from "../../gym-stepper";
import Memberships from "../../memberships";
import FAQ from "../../faq";

export default function GymHome() {
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