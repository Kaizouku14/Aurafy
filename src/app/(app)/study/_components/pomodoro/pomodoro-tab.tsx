import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PomodoroTab = () => {
  return (
    <Tabs
      defaultValue="pomo"
      orientation="vertical"
      className="flex flex-col items-center py-4"
    >
      <TabsList>
        <TabsTrigger value="pomo">Pomodoro</TabsTrigger>
        <TabsTrigger value="short">Short Break</TabsTrigger>
        <TabsTrigger value="long">Long Break</TabsTrigger>
      </TabsList>
      <TabsContent value="pomo">Pomodoro settings here.</TabsContent>
      <TabsContent value="short">Short break settings here.</TabsContent>
      <TabsContent value="long">Long break settings here.</TabsContent>
    </Tabs>
  );
};

export default PomodoroTab;
