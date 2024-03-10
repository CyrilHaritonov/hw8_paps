import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Item {
    @PrimaryColumn()
    name: string;

    @Column("int")
    price: number;

    @Column("int")
    rm_price: number;
}