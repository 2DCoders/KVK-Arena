import GymHeader from "@/components/header/gym";
import GymHero from "../../hero/gym";
import Circle from "../../circle";
import GymStepper from "../../gym-stepper";

export default function GymHome() {
    return (
        <>
            <GymHeader />
            <GymHero />
            <GymStepper />
            <Circle />
        </>
    )
}