# Example of how to use the modules

## To add quiz questions, follow the format below:
````
{
  "title": "INTEL_ASSESSMENT // PROTOCOL_BETA",
  "questions": [
    {
      "id": 1, # Always increment id number
      "text": "", # Question goes here
      "options": [
        "A) option1",
        "B) option2",
        "C) option3",
        "D) option4"
      ],
      "correctAnswer": "C) option3",
      "explanation": "why option 3 is better or best answer"
    },
    { # Question example
      "id": 2, # Always increment id number
      "text": "During an investigation, what is the primary goal of maintaining the 'Chain of Custody'?",
      "options": [
        "A) To ensure data remains encrypted",
        "B) To preserve the integrity and admissibility of evidence",
        "C) To document the cost of the investigation",
        "D) To identify the threat actor's IP address"
      ],
      "correctAnswer": "B) To preserve the integrity and admissibility of evidence",
      "explanation": "Chain of Custody tracks who handled the evidence, when, and where, ensuring it hasn't been tampered with for legal proceedings."
    },
    {
        .
        .
        .
    }
  ]
}
````