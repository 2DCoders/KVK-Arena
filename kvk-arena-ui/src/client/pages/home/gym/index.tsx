import GymHeader from "@/components/header/gym";
import GymHero from "../../hero/gym";
// import Circle from "../../circle";
import GymStepper from "../../gym-stepper";
import Memberships from "../../memberships";
import FAQ from "../../faq";
import { useLayoutEffect } from "react";
import Trainers from "../../trainers";
import GymFeatures from "../../features/gym";
import Footer from "@/components/footer";


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
            <Trainers />
            <FAQ />
            <GymFeatures />
            <Footer />
            {/* <Circle /> */}
        </>
    )
}