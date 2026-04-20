import { useState } from "react";
import ChessRPG from "./components/ChessRpg";
import  Header from "./components/Header";
import moon from "./assets/moon.png";

interface GamePopupProps {
  setIsGameOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GamePopup = ({ setIsGameOpen}: GamePopupProps) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => setIsGameOpen(false)}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border-4 border-black bg-cover bg-center shadow-2xl transition-all bg-[url('./assets/background.png')]">
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 p-6">
          <ChessRPG />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[url('./assets/background.png')] text-gray-900 p-4 md:p-8 font-serif">
      <Header/>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Column: Secondary News */}
        <div className="md:col-span-1 border-r border-gray-300 pr-4">
          <article className="mb-6">
            <h3 className="text-xl font-bold leading-tight mb-2 uppercase">
              Side Project#01
            </h3>
            <p className="text-sm leading-relaxed">
              A load-balancer implemented in Go. Part of my learning journey in Go.
            </p>
          </article>
          <hr className="border-gray-400 mb-4" />
          <article>
            <h3 className="text-lg font-bold leading-tight mb-2">
              SIDE PROJECT#02
            </h3>
            <p className="text-sm leading-releaxed">
              An on-going project trying to write an interpreter in GO.
            </p>
          </article>
        </div>

        {/* Center: Hero Story */}
        <div className="md:col-span-2">
          <article className="border-b border-gray-300 pb-6 mb-6">
            <h2 className="text-4xl md:text-5xl font-black leading-none mb-4 text-center md:text-left">
              SOMETHING THAT I START REALLY RECENTLY
            </h2>
            <div className="aspect-video bg-gray-300 mb-4 overflow-hidden border border-black">
              <img
                src={moon}
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="columns-2 gap-6 text-justify">
              <p className="indent-8 mb-4 first-letter:text-5xl first-letter:font-bold  first-letter:mr-2">
                PIXEL ART -- this is something that I really like.
              </p>
            </div>
          </article>
        </div>

        <div className="md:col-span-1 border-l border-gray-300 pl-4">
          <div className="bg-gray-100 p-4 border border-black mb-6">
            <span className="text-xs font-sans font-bold uppercase block mb-2">
              Advertisement
            </span>
            <h4
              onClick={() => setIsGameOpen(true)}
              className="text-2xl font-black text-center border-2 border-black py-2 mb-2"
            >
              GAME PROTOTYPE
            </h4>
            <p className="text-xs text-center">
              Click the square above to start the game.
            </p>
          </div>
          {isGameOpen && <GamePopup setIsGameOpen={setIsGameOpen} />}
          <article>
            <h3 className="text-xl font-bold leading-tight mb-2 italic underline">
              The Editorial
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              You may reach out to me at 
            </p>
          </article>
        </div>
      </main>
    </div>
  );
};

export default App;
