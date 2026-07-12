import Foundation

/// One historical event to memorize and recall.
struct HistoricEvent: Identifiable, Hashable, Codable {
    let id: UUID
    let year: Int
    let description: String

    init(year: Int, description: String) {
        self.id = UUID()
        self.year = year
        self.description = description
    }
}

/// Bank of memorable world history events for the Historic Dates discipline.
enum HistoricEventsBank {
    static let events: [HistoricEvent] = [
        HistoricEvent(year: 776,  description: "First recorded ancient Olympic Games held in Greece"),
        HistoricEvent(year: 44,   description: "Julius Caesar assassinated on the Ides of March"),
        HistoricEvent(year: 79,   description: "Mount Vesuvius erupts and buries Pompeii"),
        HistoricEvent(year: 476,  description: "Fall of the Western Roman Empire"),
        HistoricEvent(year: 622,  description: "Muhammad's Hijra from Mecca to Medina"),
        HistoricEvent(year: 793,  description: "Viking raid on Lindisfarne monastery"),
        HistoricEvent(year: 1066, description: "Norman Conquest: Battle of Hastings"),
        HistoricEvent(year: 1215, description: "Magna Carta signed by King John of England"),
        HistoricEvent(year: 1347, description: "Black Death begins devastating Europe"),
        HistoricEvent(year: 1440, description: "Gutenberg invents the movable-type printing press"),
        HistoricEvent(year: 1453, description: "Constantinople falls to the Ottoman Empire"),
        HistoricEvent(year: 1492, description: "Columbus reaches the Americas"),
        HistoricEvent(year: 1517, description: "Martin Luther nails his 95 Theses, sparking the Reformation"),
        HistoricEvent(year: 1543, description: "Copernicus publishes heliocentric model of the solar system"),
        HistoricEvent(year: 1588, description: "English fleet defeats the Spanish Armada"),
        HistoricEvent(year: 1620, description: "Pilgrims land at Plymouth Rock on the Mayflower"),
        HistoricEvent(year: 1687, description: "Newton publishes Principia Mathematica"),
        HistoricEvent(year: 1762, description: "Catherine the Great becomes Empress of Russia"),
        HistoricEvent(year: 1776, description: "United States Declaration of Independence signed"),
        HistoricEvent(year: 1789, description: "French Revolution begins; Bastille stormed"),
        HistoricEvent(year: 1804, description: "Napoleon crowned Emperor of France"),
        HistoricEvent(year: 1815, description: "Napoleon defeated at the Battle of Waterloo"),
        HistoricEvent(year: 1848, description: "Year of Revolutions sweeps across Europe"),
        HistoricEvent(year: 1859, description: "Darwin publishes On the Origin of Species"),
        HistoricEvent(year: 1865, description: "American Civil War ends; Lincoln assassinated"),
        HistoricEvent(year: 1876, description: "Alexander Graham Bell patents the telephone"),
        HistoricEvent(year: 1895, description: "Lumière brothers screen the first public film"),
        HistoricEvent(year: 1903, description: "Wright brothers achieve first powered flight at Kitty Hawk"),
        HistoricEvent(year: 1905, description: "Einstein publishes his special theory of relativity"),
        HistoricEvent(year: 1912, description: "RMS Titanic sinks in the North Atlantic"),
        HistoricEvent(year: 1914, description: "World War I begins after assassination of Archduke Franz Ferdinand"),
        HistoricEvent(year: 1917, description: "Russian Revolution; Tsar Nicholas II abdicates"),
        HistoricEvent(year: 1918, description: "World War I ends with Armistice Day"),
        HistoricEvent(year: 1928, description: "Alexander Fleming discovers penicillin"),
        HistoricEvent(year: 1929, description: "Wall Street Crash triggers the Great Depression"),
        HistoricEvent(year: 1939, description: "World War II begins with Germany invading Poland"),
        HistoricEvent(year: 1945, description: "World War II ends; atomic bombs dropped on Hiroshima and Nagasaki"),
        HistoricEvent(year: 1947, description: "India gains independence from Britain"),
        HistoricEvent(year: 1953, description: "Watson and Crick describe the structure of DNA"),
        HistoricEvent(year: 1957, description: "Soviet Union launches Sputnik, first artificial satellite"),
        HistoricEvent(year: 1961, description: "Yuri Gagarin becomes the first human in space"),
        HistoricEvent(year: 1963, description: "President Kennedy assassinated in Dallas"),
        HistoricEvent(year: 1969, description: "Apollo 11 lands on the Moon; Armstrong walks on lunar surface"),
        HistoricEvent(year: 1989, description: "Fall of the Berlin Wall"),
        HistoricEvent(year: 1991, description: "Soviet Union dissolves; Cold War ends"),
        HistoricEvent(year: 2001, description: "September 11 terrorist attacks on the United States"),
        HistoricEvent(year: 2008, description: "Global financial crisis triggers Great Recession"),
        HistoricEvent(year: 2020, description: "COVID-19 declared a global pandemic by the WHO"),
    ]
}
