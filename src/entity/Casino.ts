import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Casino {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column()
    outcomes: string[];

    @Column()
    chances: number[];

    @Column()
    prizes: number[];

    @Column()
    pictures: string[];
}