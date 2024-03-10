import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"

@Entity()
export class User {

    @PrimaryColumn()
    id: number;

    @Column()
    char_name: string;

    @Column()
    avatar: string

    @Column()
    is_admin: boolean

    @Column()
    char_class: string
}
