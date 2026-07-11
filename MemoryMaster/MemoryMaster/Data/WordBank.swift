import Foundation

/// Concrete nouns for word training and random name pools for the
/// Names & Faces discipline.
enum WordBank {

    static let words: [String] = [
        "apple", "anchor", "arrow", "balloon", "banana", "barrel", "basket", "beach",
        "bell", "bicycle", "bottle", "bridge", "brush", "bucket", "butter", "button",
        "cabin", "cactus", "camera", "candle", "carpet", "castle", "chain", "cherry",
        "church", "circus", "cloud", "clown", "coconut", "coffee", "compass", "crown",
        "curtain", "dolphin", "donkey", "dragon", "drum", "eagle", "engine", "feather",
        "fence", "flag", "flute", "forest", "fountain", "garden", "glacier", "glove",
        "guitar", "hammer", "harbor", "helmet", "honey", "island", "jacket", "jungle",
        "kettle", "kite", "ladder", "lantern", "lemon", "library", "lighthouse", "lion",
        "lobster", "magnet", "mirror", "monkey", "mountain", "mushroom", "needle", "nest",
        "ocean", "orange", "orchestra", "ostrich", "palace", "parrot", "peach", "pearl",
        "pencil", "penguin", "piano", "pillow", "pirate", "pizza", "planet", "pocket",
        "pyramid", "rabbit", "rainbow", "river", "robot", "rocket", "rose", "saddle",
        "sailor", "sandwich", "scissors", "shadow", "shark", "shield", "shovel", "spider",
        "spoon", "statue", "strawberry", "submarine", "sunflower", "sword", "teapot",
        "telescope", "tent", "thunder", "ticket", "tiger", "tomato", "tractor", "train",
        "treasure", "trophy", "trumpet", "tunnel", "turtle", "umbrella", "unicorn",
        "valley", "violin", "volcano", "waffle", "wagon", "wallet", "walnut", "whale",
        "wheel", "whistle", "window", "wizard", "wolf", "zebra",
    ]

    static let firstNames: [String] = [
        "Ali", "Amira", "Anna", "Ben", "Carlos", "Chloe", "Daniel", "Dina",
        "Elena", "Emil", "Farah", "Felix", "Grace", "Hassan", "Ida", "Ivan",
        "Jana", "John", "Karim", "Laila", "Leo", "Lucas", "Maria", "Marek",
        "Nadia", "Noah", "Olga", "Omar", "Petra", "Rami", "Rosa", "Sami",
        "Sara", "Tariq", "Tessa", "Tom", "Uma", "Victor", "Yara", "Zane",
    ]

    static let lastNames: [String] = [
        "Adams", "Baker", "Carter", "Diaz", "Evans", "Farouk", "Garcia",
        "Haddad", "Ibrahim", "Jensen", "Khan", "Larsen", "Meyer", "Nasser",
        "Olsen", "Petrov", "Qureshi", "Rossi", "Saleh", "Tanaka", "Ueda",
        "Vargas", "Weber", "Xu", "Yamada", "Zaki",
    ]

    static func randomName() -> String {
        "\(firstNames.randomElement()!) \(lastNames.randomElement()!)"
    }
}
