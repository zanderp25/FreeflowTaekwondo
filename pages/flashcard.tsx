import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import untypedBelts from "../public/data/belts.json";
import untypedTheory from "../public/data/theory.json";
import { belt, theory } from "../types";
import Styles from "../styles/pages/flashcard.module.css";

const belts: Record<string, belt> = untypedBelts;
const theory: Record<string, theory> = untypedTheory;


const typeInstructions: Record<string, string | null> = {
    "translate": "What's this in Korean?",
    "exact": null,
    "GPT": null,
    "typo": null,
    "opinion": "There is no right answer, just give your opinion",
    "list": null,
    "DNA": null,
}

function questionSide(question: theory["questions"][0]) {
    return <>
        <p>{question.prompt}</p>
        <br />
        <p>{typeInstructions[question.responseType] || ""}</p>
    </>
}
function answerSide(question: theory["questions"][0]) {
    return <p>{question.answer}</p>
}


export default function Flashcards() {
    const [belt, _setBelt] = useState("white-senior");
    const [hasBelt, setHasBelt] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [cardAnimationStage, setCardAnimationStage] = useState(0);  // 0 for front (question), 2 for back (answer), 1 for q-> a, 3 for a-> q
    const [isShaking, setIsShaking] = useState(false);
    const cardStages = [ Styles.cardFront, Styles.cardFlip ];

    function setBelt(value: number) {
        const belt = Object.keys(belts)[value];
        _setBelt(belt);
        localStorage.setItem("belt", belt);
    }

    useEffect(() => {
        const storedBelt = localStorage.getItem("belt");
        if (storedBelt && storedBelt in belts) {
            setBelt(Object.keys(belts).indexOf(storedBelt));
            setHasBelt(true);
        } else {
            alert("Please select a belt");
            setBelt(0);
        }
    }, []);

    const ignoredTypes = ["DNA"]
    const questions = theory[belt].questions.filter((x) => !ignoredTypes.includes(x.responseType));
    const extra = theory[belt].extra ? theory[belt].extra!.filter((x) => !ignoredTypes.includes(x.responseType)) : [];
    let questionTypes = ["questions"];

    let filteredQuestions = questions;

    const shakeCard = () => {
        console.log("Shaking card");
        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
        }, 1000);
    }
    const flipCard = () => {
        if (!filteredQuestions[currentQuestion].answer) {
            shakeCard();
            return;
        }
        if (cardAnimationStage % 2 === 0) {
            setCardAnimationStage(cardAnimationStage + 1);
            console.log("Flipping card", cardAnimationStage);
            // Wait 0.3s
            setTimeout(() => {
                setCardAnimationStage((cardAnimationStage + 2) % 4);
            }, 300);
        }
    }
    const nextQuestion = () => {
        if (cardAnimationStage % 2 === 0) {
            setCurrentQuestion((currentQuestion + 1) % filteredQuestions.length);
            setCardAnimationStage(0);
        }
    }
    const previousQuestion = () => {
        if (cardAnimationStage % 2 === 0) {
            setCurrentQuestion((currentQuestion - 1 + filteredQuestions.length) % filteredQuestions.length);
            setCardAnimationStage(0);
        }
    }

    return <>
        <a href="/checklist">Back button!</a>

        <p>{currentQuestion + 1} / {filteredQuestions.length}</p>
        <p>Filter button!</p>

        <div className={Styles.cardControl}>
            <p onClick={() => previousQuestion()}>Back</p>
            <div className={Styles.card + " " + cardStages[cardAnimationStage % 2] + " " + (isShaking ? Styles.shake : null)} onClick={() => flipCard()}>
                { cardAnimationStage < 2 ? questionSide(filteredQuestions[currentQuestion]) : answerSide(filteredQuestions[currentQuestion]) }
            </div>
            <p onClick={() => nextQuestion()}>Next</p>
        </div>
        <p>Mark question as [correct]</p>
    </>
}
