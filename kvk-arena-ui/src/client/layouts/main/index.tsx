import Footer from "@/components/footer";
import Header from "@/components/header";

interface LayoutProps {
    children: React.ReactNode;
}

const Main: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{ overflowX: "hidden", overflowY: "hidden" }} className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default Main;