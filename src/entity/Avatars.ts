import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Avatars {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    link: string;
}