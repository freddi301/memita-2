export type Sql = {
  <Row>(strings: TemplateStringsArray, ...values: (number | string)[]): {
    run(): Promise<void>;
    all(): Promise<Array<Row>>;
  };
};
