import React from "react";
import { ordinal } from "../utils/util";
import "./HighScores.css";
import { getValue, setValue } from "../utils/storage";

/**
 * Defines JSON object structure for how high scores are saved in localStorage.
 *
 * Need to export for tests
 */
export interface HighScoreJSON {
    score: string;
    date: string;
}

export class HighScore {
    score: number;
    date: Date;
    constructor(score: number, date: Date = new Date()) {
        this.score = score;
        this.date = date;
    }

    formatDate(): string {
        let formattingOptions: {} = {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        };
        return this.date.toLocaleString("default", formattingOptions);
    }

    jsonify(): HighScoreJSON {
        return { score: this.score.toString(), date: this.date.toString() };
    }
}

interface HighScoresProps {
    numTopScores: number;
    currentScore: number;
    isEndGame: () => boolean;
}

export class HighScores extends React.Component<HighScoresProps, {}> {
    localStorageKey: string;
    constructor(props: HighScoresProps) {
        super(props);

        this.localStorageKey = "highScores";
    }

    render(): JSX.Element {
        let highScores: HighScore[] = this.getScores();

        if (this.props.isEndGame()) {
            highScores = highScores
                .concat(new HighScore(this.props.currentScore))
                .sort((first, second) => first.score - second.score)
                .reverse()
                .slice(0, this.props.numTopScores); // Only store in memory the top "this.props.numTopScores" scores.

            this.saveScores(highScores);
        }

        return (
            <>
                <div className="highScoresMenu">
                    <strong>High Scores</strong>
                    <ul>
                        <li>
                            <button
                                className="button"
                                onClick={() => {
                                    document
                                        .getElementById("highScoreImport")
                                        ?.click();
                                }}
                            >
                                Upload
                            </button>
                            <input
                                id="highScoreImport"
                                type="file"
                                hidden
                                onChange={this.loadHighScores.bind(this)}
                            />
                        </li>
                        <li>
                            <button
                                className="button"
                                onClick={this.downloadHighScores.bind(this)}
                            >
                                Download
                            </button>
                        </li>
                    </ul>
                </div>

                {highScores.length === 0 ? (
                    "No high scores"
                ) : (
                    <table>
                        <tbody>
                            {highScores.map((score, index) => (
                                <tr key={index + 1}>
                                    <td>
                                        <strong>{ordinal(index + 1)}</strong>
                                    </td>
                                    <td>{score.score}</td>
                                    <td>{score.formatDate()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </>
        );
    }

    parseJSON(rawJSON: string): HighScore[] {
        return (JSON.parse(rawJSON) as HighScoreJSON[]).map((s) => {
            let score: number = Number.parseInt(s.score);
            let date: Date = new Date(s.date);
            return new HighScore(score, date);
        });
    }

    /**
     * Convert high scores to JSON and save to {@link localStorage}.
     */
    private saveScores(scores: HighScore[]): void {
        let JSONScores: HighScoreJSON[] = scores.map((score) =>
            score.jsonify(),
        );
        setValue(this.localStorageKey, JSON.stringify(JSONScores));
    }

    /**
     * Check {@link localStorage} for high scores. If any high scores are found, parse the JSON data
     * into a list of {@link HighScore} objects.
     *
     * If no high scores are found in {@link localStorage}, return an empty list.
     *
     * @returns list of {@link HighScore} objects.
     */
    private getScores(): HighScore[] {
        let scoresData: string | null = getValue(this.localStorageKey);
        return scoresData === null ? [] : this.parseJSON(scoresData);
    }

    private downloadHighScores(): void {
        let scores: string = JSON.stringify(this.getScores());
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            scores,
        )}`;

        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "circles_high_scores.json";
        link.click();
    }

    private loadHighScores(e: React.ChangeEvent<HTMLInputElement>): void {
        let files: FileList | null = e.target.files;
        if (files !== null) {
            let file: File = files[0];

            let fileReader: FileReader = new FileReader();
            fileReader.readAsText(file);

            fileReader.onload = () => {
                let rawJSON: string = fileReader.result as string;
                this.saveScores(this.parseJSON(rawJSON));
            };

            fileReader.onloadend = () => {
                this.forceUpdate();
            };

            fileReader.onerror = () => {
                alert(`unable to load file ${file.name}`);
            };
        }
    }
}
