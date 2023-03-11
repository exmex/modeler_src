const AutolayoutFactory = require("../autolayout-factory");
const FilenameProvider = require("../../filename-provider");
const AutolayoutProcessor = require("../autolayout-processor");

const os = require("os");
const fs = require("fs").promises;

it("should return correct parameters", async () => {
    //given
    const filenameProvider = new FilenameProvider(os.tmpdir());
    const payloadProcessor = new AutolayoutProcessor();
    const builder = new AutolayoutFactory(filenameProvider, payloadProcessor)

    //when
    const result = await builder.createAutolayoutExecutor({ model: JSON.stringify({}), layoutType: "simple-grid", autosize: true, expandNested: false, diagramId: "id" });

    //then
    expect(result.parameters.args[0]).toBeDefined();
    expect(result.parameters.args[1]).toBeDefined();
    expect(result.parameters.args[2]).toEqual("simple-grid");
    expect(result.parameters.args[3]).toEqual(true)
    expect(result.parameters.args[4]).toEqual(false)
    expect(result.parameters.args[5]).toEqual("id")

    //cleanup
    await fs.unlink(result.parameters.args[0]);
});