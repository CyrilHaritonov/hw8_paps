import { AppDataSource } from "../data-source";
import { Market } from "../entity/Market";

export class MarketService {
    private static marketRepo = AppDataSource.getRepository(Market);

    static create(owner_id: number, price: number, item_id: number): void {
        const new_offer = new Market();
        new_offer.owner_id = owner_id;
        new_offer.price = price;
        new_offer.item_id = item_id;
        this.marketRepo.save(new_offer);
    }

    static delete(offer_id: number) {
        this.marketRepo.softDelete(offer_id);
    }

    static buyOffer(buyer_id: number, offer_id: number): Promise<boolean> {

    }
}