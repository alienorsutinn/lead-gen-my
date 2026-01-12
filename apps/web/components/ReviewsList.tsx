
import { Star } from 'lucide-react';

// Assuming Review type matching the DB schema largely
type Review = {
    id: string;
    authorName: string;
    rating: number;
    text: string;
    publishTime?: string | null;
    sentiment?: string | null;
};

export function ReviewsList({ reviews }: { reviews: Review[] }) {
    if (!reviews || reviews.length === 0) return null;

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                    <Star size={20} fill="currentColor" />
                </span>
                Google Reviews
            </h3>

            <div className="space-y-6">
                {reviews.slice(0, 10).map((review) => (
                    <div key={review.id} className="border-b border-slate-50 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-800">{review.authorName}</div>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                {review.rating.toFixed(1)} <Star size={12} fill="currentColor" />
                            </div>
                        </div>
                        <div className="text-sm text-slate-500 italic mb-2">{review.publishTime || 'Recently'}</div>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            "{review.text}"
                        </p>
                        {review.sentiment && (
                            <div className="mt-2">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${review.sentiment === 'positive' ? 'bg-green-50 text-green-600' :
                                        review.sentiment === 'negative' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-50 text-slate-500'
                                    }`}>
                                    {review.sentiment}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {reviews.length > 10 && (
                <div className="mt-6 text-center">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                        View All {reviews.length} Reviews
                    </button>
                </div>
            )}
        </div>
    );
}
