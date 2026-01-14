import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import { MainMenu } from "./components/UI/MainMenu";
import { SplashScreen } from "./components/UI/SplashScreen";

function App() {
  return (
    <main className="h-full w-full relative">
      <GameCanvas />
      <HUD />
      <SplashScreen />
      <MainMenu />
    </main>
  );
}

export default App;
