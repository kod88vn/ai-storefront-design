import { act, renderHook, waitFor } from "@testing-library/react";
import { useOrchestrator } from "@/hooks/use-orchestrator";
import { useStudioStore } from "@/lib/store";
import { defaultConfig, defaultPageContainers } from "@/lib/store/defaults";

function streamResponse(events: unknown[]): Response {
    const encodeAscii = (value: string) =>
        Uint8Array.from(Array.from(value).map((char) => char.charCodeAt(0)));

    const chunks = events.map(
        (event) => encodeAscii(`data: ${JSON.stringify(event)}\n\n`),
    );
    let index = 0;

    return {
        ok: true,
        status: 200,
        statusText: "OK",
        body: {
            getReader() {
                return {
                    async read() {
                        if (index >= chunks.length) {
                            return { done: true, value: undefined };
                        }
                        const value = chunks[index];
                        index += 1;
                        return { done: false, value };
                    },
                    releaseLock() {
                        // no-op
                    },
                };
            },
        },
    } as unknown as Response;
}

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

describe("useOrchestrator", () => {
    const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        fetchMock.mockReset();
        global.fetch = fetchMock;
        // jsdom in this repo does not provide structuredClone.
        (globalThis as unknown as { structuredClone?: <T>(value: T) => T }).structuredClone =
            clone;
        (globalThis as unknown as { TextDecoder?: new () => { decode: (input: Uint8Array) => string } }).TextDecoder =
            class {
                decode(input: Uint8Array) {
                    return String.fromCharCode(...input);
                }
            };
        useStudioStore.setState({
            config: clone(defaultConfig),
            pageContainers: clone(defaultPageContainers),
            currentPage: "home",
            agentPlan: null,
            orchestratorGoal: null,
            orchestratorContext: null,
            appliedSummary: null,
            thinkingText: "",
            auditLog: [],
        });
    });

    it("keeps footer as the last section when applying sectionOrder updates", async () => {
        fetchMock.mockResolvedValue(
            streamResponse([
                {
                    type: "config_update",
                    configUpdate: {
                        sectionOrder: ["hero", "footer", "categories"],
                    },
                },
                { type: "complete", agentStep: "complete" },
            ]),
        );

        const { result } = renderHook(() => useOrchestrator());

        await act(async () => {
            await result.current.startOrchestrator("reorder", {
                currentConfig: clone(useStudioStore.getState().config),
                visionUrl: "https://example.com",
            });
        });

        const summaryAfter = useStudioStore.getState().appliedSummary?.sectionOrder?.after;
        expect(summaryAfter).toBeTruthy();
        expect(summaryAfter?.[summaryAfter.length - 1]).toBe("footer");
    });

    it("resumes with approved planFeedback and previous plan context", async () => {
        fetchMock.mockResolvedValue(
            streamResponse([{ type: "complete", agentStep: "complete" }]),
        );

        useStudioStore.setState({
            orchestratorGoal: "apply approved plan",
            orchestratorContext: {
                currentConfig: clone(defaultConfig),
                visionUrl: "https://example.com",
            },
            agentPlan: {
                id: "plan-1",
                description: "Use earthy style",
                layoutProposal: "Split hero",
                colorProposal: "Earth tones",
                approved: null,
            },
        });

        const { result } = renderHook(() => useOrchestrator());

        act(() => {
            result.current.resumeWithFeedback({ approved: true });
        });

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        const [, init] = fetchMock.mock.calls[0];
        const body = JSON.parse(String(init?.body ?? "{}")) as {
            context?: {
                planFeedback?: {
                    approved?: boolean;
                    previousPlan?: {
                        description: string;
                        layoutProposal: string;
                        colorProposal: string;
                    };
                };
            };
        };

        expect(body.context?.planFeedback?.approved).toBe(true);
        expect(body.context?.planFeedback?.previousPlan).toEqual({
            description: "Use earthy style",
            layoutProposal: "Split hero",
            colorProposal: "Earth tones",
        });
    });
});
