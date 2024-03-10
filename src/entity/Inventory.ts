import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Inventory {
    @PrimaryColumn()
    id: string;

    @Column()
    owner: string;

    @Column()
    item_id: string;
}