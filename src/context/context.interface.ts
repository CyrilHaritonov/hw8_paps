import { Context, Scenes } from "telegraf";
import { SceneContext, SceneSession } from "telegraf/typings/scenes";

export interface SessionData {
    
}

export interface IBotSceneSession extends Scenes.SceneSessionData {

}

export interface IBotContext extends Context {
    session: SessionData;
    scene: Scenes.SceneContextScene<IBotContext, IBotSceneSession>;
}