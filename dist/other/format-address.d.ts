export declare type Address = {
    street: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
};
export declare const formatAddress: (address: Address) => string;
