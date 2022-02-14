import LevelScenario from "./levelscenario";
import Question from "./question";

export default class Config
{
    static levels = [];

    static getLevelsScenario(levelIndex:number) : LevelScenario
    {
        let result = new LevelScenario();
        let qIndex = 0;

        Config.levels[levelIndex].forEach((q) =>
        {
            let question = new Question();

            question.questionIndex = q.Question;
            question.task = q.Task;
            question.totalTiles = q.TotalTiles;
            question.tileColorsInvolved = q.TileColorsInvolved;
            question.tileItemInvolved = q.TileItemInvolved;
            question.tileMovementsCount = q.TileMovements;

            result.questions[qIndex] = question;
            qIndex++;
        })

        return result;
    }
}
