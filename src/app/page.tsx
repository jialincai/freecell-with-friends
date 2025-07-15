import FreecellGame from "@components/game/FreecellGame";
import Overlay from "@components/ui/Overlay";
import MenuBar from "@components/ui/MenuBar";
import { Suspense } from "react";

const HomePage = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <Overlay />
      </Suspense>
      <MenuBar />
      <FreecellGame />
    </div>
  );
};

export default HomePage;
