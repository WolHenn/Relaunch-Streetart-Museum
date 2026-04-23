interface Props {
    selected: string | null;
    onSelect: (letter: string | null) => void;
}

const LETTERS = ["1-9", "A","B","C","D","E","F","G","H","I","J","K","L","M",
                  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

export default function AlphabetButtons({ selected, onSelect }: Props) {
    return (
        <div className="flex flex-wrap gap-1 my-3">
            <button
                onClick={() => onSelect(null)}
                className={`px-2 py-1 rounded text-sm border
                    ${selected === null
                        ? "bg-blue-600 text-white"
                        : "bg-white hover:bg-gray-100"}`}
            >
                Alle
            </button>
            {LETTERS.map((letter) => (
                <button
                    key={letter}
                    onClick={() => onSelect(letter === "1-9" ? null : letter)}
                    className={`px-2 py-1 rounded text-sm border
                        ${selected === letter
                            ? "bg-blue-600 text-white"
                            : "bg-white hover:bg-gray-100"}`}
                >
                    {letter}
                </button>
            ))}
        </div>
    );
}