import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExtendedBaseEntity } from '../ExtendedBaseEntity';

@Entity()
export class File extends ExtendedBaseEntity {
    constructor(partial: Partial<File>) {
        super();
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column({ type: 'bytea' })
    data: Buffer;
}
