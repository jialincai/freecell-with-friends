import FreecellGame from "@components/FreecellGame";
import MenuBar from "@components/MenuBar";

const HomePage: React.FC = () => {
  return (
    <div>
      <MenuBar />
      <FreecellGame />
    </div>
  );
};

export default HomePage;
