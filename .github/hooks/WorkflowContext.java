import java.io.IOException;

public class WorkflowContext {
    public static void main(String[] args) throws IOException {
        System.in.readAllBytes();
        String message =
                "Project workflow: Requirements -> Architecture -> Design Review -> "
                        + "Implementation Planning -> Implementation -> Code Review -> "
                        + "Verification -> Pull Request. Use the SDLC Orchestrator Agent and "
                        + "matching role skills. Pause for required human approvals; do not "
                        + "invent missing information or claim unrun checks passed.";
        System.out.println("{\"systemMessage\":\"" + message + "\"}");
    }
}
