/**
 * Question model
 */
export interface IQuestion {
  id: number
  text: string
  image?: string
  sound?: string
  option1: string
  option2: string
  option3: string
  option4: string
  right: number
}

const options = ['A', 'B', 'C', 'D']

/**
 * Returns the right answer letter
 *
 * @param {IQuestion} question
 * @returns {string}
 */
export const rightAnswer = (question: IQuestion): string => {
  return options[question.right - 1]
}
