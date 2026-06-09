export class CreateProblemCommand {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly difficulty: string,
    public readonly timeLimit: number,
    public readonly memoryLimit: number,
    public readonly tags: string[],
    public readonly templates: any[],
    public readonly testCases: any[],
    public readonly constraints?: string[],
  ) {}
}