export interface Feature {
    id: number;
    feature_key: string;
    value: string;
}

export interface Plan {
    id: number;
    name: string;
    slug: string;
    desc: string | null;
    price: number | string;
    is_active: boolean;
    features?: Feature[];
}

export interface WelcomeProps {
    plans: Plan[];
}
