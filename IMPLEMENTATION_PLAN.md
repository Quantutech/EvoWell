# Evo System Implementation Plan

## Overview
Evo is a navigation intelligence layer designed to guide users to the right mental health support through structured conversational triage. This plan outlines the implementation of the Evo system, including the modal, conversation logic, recommendation engine, and integration into the existing EvoWell application.

## Key Changes
- **New Directory**: `src/components/evo` for all Evo-related components.
- **Main Layout**: Integration of `EvoTrigger` (FAB) and `EvoModal` into `src/layouts/MainLayout.tsx`.
- **New Components**:
    - `EvoModal`: The main container for the conversation.
    - `EvoTrigger`: Floating action button to launch Evo.
    - `ConversationFlow`: Manages questions and user input.
    - `RecommendationEngine`: Processes signals and fetches results.
    - `EvoIcon`: Animated 3D icon.

## Implementation Steps

1.  **Project Setup & Types**
    -   Define TypeScript interfaces for `UserSignal`, `Question`, `Recommendation`, etc.
    -   Create `src/components/evo` directory.

2.  **Evo Icon & Trigger**
    -   Create `EvoIcon` (abstract 3D motif using CSS/SVG).
    -   Create `EvoTrigger` component (Floating Action Button).
    -   Add `EvoTrigger` to `src/layouts/MainLayout.tsx`.

3.  **Evo Modal Structure**
    -   Create `EvoModal` component with backdrop, animation, and dismiss logic.
    -   Ensure accessibility (focus trap, escape key).

4.  **Conversation Logic (State Machine)**
    -   Implement the question flow (Layer 1 & Layer 2) as defined in the spec.
    -   Create state management for answers and navigation (Next/Skip).
    -   Implement Crisis Detection logic.

5.  **Recommendation Engine**
    -   Create a service or hook to process `UserSignal`.
    -   Map signals to `SearchFilters` for `providerService`.
    -   Map signals to resources (hardcoded or fetched).
    -   Implement the logic to rank providers based on match score.

6.  **Results UI**
    -   Design and implement the recommendation output screen.
    -   Show Primary Recommendation, Matched Providers, and Resources.
    -   Implement "Transparency Line" for each recommendation.

7.  **Integration & Testing**
    -   Verify the flow from Trigger -> Conversation -> Results.
    -   Test crisis triggers.
    -   Ensure responsive design and theme consistency.

## Technical Considerations
-   **State Management**: Local state within `EvoModal` or a dedicated Context is sufficient as the conversation is ephemeral.
-   **Performance**: Load Evo components lazily if possible, or keep them lightweight.
-   **Safety**: Crisis detection must be robust and immediate.
-   **Design**: Strict adherence to the "medical-grade trust" aesthetic (no emojis, calm colors).

## Success Criteria
-   User can open Evo from anywhere.
-   Conversation flows logically through Layer 1 and optionally Layer 2.
-   Crisis inputs trigger the safety protocol.
-   Recommendations are relevant to the inputs.
-   UI matches the EvoWell brand and Evo specific guidelines.
