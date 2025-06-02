import FreecellGame from "@components/game/FreecellGame";
import MenuBar from "@components/ui/MenuBar";

const HomePage = () => {
  return (
    <div>
      <MenuBar />
      <FreecellGame />
    </div>
  );
};

export default HomePage;
