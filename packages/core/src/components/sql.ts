export type Sql = {
  <Row>(strings: TemplateStringsArray, ...values: (number | string)[]): {
    run(): Promise<void>;
    all(): Promise<Array<Row>>;
    text(): string;
  };
  close(): Promise<void>;
};
