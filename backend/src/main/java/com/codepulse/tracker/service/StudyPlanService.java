//package com.codepulse.tracker.service;
//
//import com.codepulse.tracker.dto.DailyPlanDto;
//import com.codepulse.tracker.dto.ProblemDto;
//import com.codepulse.tracker.dto.StudyPlanRequest;
//import com.codepulse.tracker.entity.*;
//import com.codepulse.tracker.mapper.DtoMapper;
//import com.codepulse.tracker.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDate;
//import java.time.format.DateTimeFormatter;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class StudyPlanService {
//
//    private final StudyPlanRepository studyPlanRepository;
//    private final ProblemRepository problemRepository;
//    private final TopicRepository topicRepository;
//    private final DailyTaskRepository dailyTaskRepository;
//    private final UserProblemProgressRepository progressRepository;
//
//    @Transactional
//    public List<DailyPlanDto> createStudyPlan(StudyPlanRequest request, User currentUser) {
//        // Step 1: Create and save the StudyPlan entity
//        StudyPlan studyPlan = new StudyPlan();
//        studyPlan.setUser(currentUser);
//        studyPlan.setSkillLevel(request.getLevel());
//        studyPlan.setDurationDays(request.getDays());
//
//        // Step 2: Fetch and set the topics for the study plan
//        Set<Topic> selectedTopics = new HashSet<>();
//        if (request.getTopics() != null && !request.getTopics().isEmpty()) {
//            for (String topicName : request.getTopics()) {
//                topicRepository.findByName(topicName).ifPresent(selectedTopics::add);
//            }
//        }
//        studyPlan.setTopics(selectedTopics);
//        StudyPlan savedStudyPlan = studyPlanRepository.save(studyPlan);
//
//        // Step 3: Generate the list of problems
//        List<Problem> problemPool = generateProblemPool(request, new ArrayList<>(selectedTopics));
//
//        // Step 4: Create daily tasks and progress records
//        List<DailyTask> dailyTasks = new ArrayList<>();
//        int totalProblems = problemPool.size();
//        for (int day = 1; day <= request.getDays(); day++) {
//            int start = (int) Math.floor((double) totalProblems * (day - 1) / request.getDays());
//            int end = (int) Math.floor((double) totalProblems * day / request.getDays());
//
//            for (int i = start; i < end; i++) {
//                Problem problem = problemPool.get(i);
//
//                DailyTask task = new DailyTask();
//                task.setStudyPlan(savedStudyPlan);
//                task.setProblem(problem);
//                task.setDayNumber(day);
//                dailyTasks.add(task);
//
//                // Create initial progress record for this user and problem if it doesn't exist
//                progressRepository.findByUserIdAndProblemId(currentUser.getId(), problem.getId())
//                        .orElseGet(() -> {
//                            UserProblemProgress newProgress = new UserProblemProgress();
//                            newProgress.setUser(currentUser);
//                            newProgress.setProblem(problem);
//                            newProgress.setStatus(UserProblemProgress.Status.pending);
//                            return progressRepository.save(newProgress);
//                        });
//            }
//        }
//
//        dailyTaskRepository.saveAll(dailyTasks);
//
//        // Step 5: Format the response
//        return formatPlanAsDto(dailyTasks, progressRepository.findAllByUserId(currentUser.getId()));
//    }
//
//    private List<Problem> generateProblemPool(StudyPlanRequest request, List<Topic> topics) {
//        Map<Problem.Difficulty, Double> distribution = getDistribution(request.getLevel());
//        int totalProblems = 3 * request.getDays(); // Aim for 3 problems per day
//
//        List<Problem> easy, medium, hard;
//        if (topics.isEmpty()) {
//            easy = problemRepository.findByDifficulty(Problem.Difficulty.Easy);
//            medium = problemRepository.findByDifficulty(Problem.Difficulty.Medium);
//            hard = problemRepository.findByDifficulty(Problem.Difficulty.Hard);
//        } else {
//            easy = problemRepository.findByDifficultyAndTopicIn(Problem.Difficulty.Easy, topics);
//            medium = problemRepository.findByDifficultyAndTopicIn(Problem.Difficulty.Medium, topics);
//            hard = problemRepository.findByDifficultyAndTopicIn(Problem.Difficulty.Hard, topics);
//        }
//
//        Collections.shuffle(easy);
//        Collections.shuffle(medium);
//        Collections.shuffle(hard);
//
//        List<Problem> finalPool = new ArrayList<>();
//        finalPool.addAll(easy.subList(0, Math.min(easy.size(), (int) (totalProblems * distribution.get(Problem.Difficulty.Easy)))));
//        finalPool.addAll(medium.subList(0, Math.min(medium.size(), (int) (totalProblems * distribution.get(Problem.Difficulty.Medium)))));
//        finalPool.addAll(hard.subList(0, Math.min(hard.size(), (int) (totalProblems * distribution.get(Problem.Difficulty.Hard)))));
//
//        Collections.shuffle(finalPool);
//        return finalPool;
//    }
//
//    private List<DailyPlanDto> formatPlanAsDto(List<DailyTask> tasks, List<UserProblemProgress> progresses) {
//        Map<Long, UserProblemProgress> progressMap = progresses.stream()
//                .collect(Collectors.toMap(p -> p.getProblem().getId(), p -> p));
//
//        Map<Integer, List<ProblemDto>> problemsByDay = tasks.stream()
//                .collect(Collectors.groupingBy(
//                        DailyTask::getDayNumber,
//                        Collectors.mapping(task -> DtoMapper.toProblemDto(task.getProblem(), progressMap.get(task.getProblem().getId())), Collectors.toList())
//                ));
//
//        return problemsByDay.entrySet().stream()
//                .map(entry -> {
//                    DailyPlanDto dto = new DailyPlanDto();
//                    dto.setDay(entry.getKey());
//                    dto.setDate(LocalDate.now().plusDays(entry.getKey() - 1).format(DateTimeFormatter.ofPattern("E, MMM dd, yy")));
//                    dto.setProblems(entry.getValue());
//                    return dto;
//                })
//                .sorted(Comparator.comparingInt(DailyPlanDto::getDay))
//                .collect(Collectors.toList());
//    }
//
//    private Map<Problem.Difficulty, Double> getDistribution(StudyPlan.SkillLevel level) {
//        return switch (level) {
//            case beginner -> Map.of(Problem.Difficulty.Easy, 0.60, Problem.Difficulty.Medium, 0.30, Problem.Difficulty.Hard, 0.10);
//            case intermediate -> Map.of(Problem.Difficulty.Easy, 0.25, Problem.Difficulty.Medium, 0.50, Problem.Difficulty.Hard, 0.25);
//            case pro -> Map.of(Problem.Difficulty.Easy, 0.10, Problem.Difficulty.Medium, 0.30, Problem.Difficulty.Hard, 0.60);
//        };
//    }
//}
//
package com.codepulse.tracker.service;

import com.codepulse.tracker.dto.DailyPlanDto;
import com.codepulse.tracker.dto.ProblemDto;
import com.codepulse.tracker.dto.StudyPlanRequest;
import com.codepulse.tracker.entity.*;
import com.codepulse.tracker.mapper.DtoMapper;
import com.codepulse.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final ProblemRepository problemRepository;
    private final TopicRepository topicRepository;
    private final DailyTaskRepository dailyTaskRepository;
    private final UserProblemProgressRepository progressRepository;

    /**
     * Creates a new study plan for the given user.
     * If an old study plan exists for the user, it will be deleted along with its
     * daily tasks, but the user's problem progress (completed status, notes) will be preserved.
     */
    @Transactional
    public List<DailyPlanDto> createStudyPlan(StudyPlanRequest request, User currentUser) {
        // --- NEW LOGIC START ---
        // Step 1: Check for and delete any existing study plan for the user.
        // This ensures stats related to a specific plan (like daily tasks) are cleared.
        studyPlanRepository.findFirstByUserIdOrderByIdDesc(currentUser.getId())
                .ifPresent(oldPlan -> {
                    // The 'orphanRemoval = true' in the StudyPlan entity will automatically
                    // delete the associated DailyTask entities when the plan is deleted.
                    studyPlanRepository.delete(oldPlan);
                });
        // --- NEW LOGIC END ---


        // Step 2: Create and save the new StudyPlan entity
        StudyPlan studyPlan = new StudyPlan();
        studyPlan.setUser(currentUser);
        studyPlan.setSkillLevel(request.getLevel());
        studyPlan.setDurationDays(request.getDays());

        // Step 3: Fetch and set the topics for the new study plan
        Set<Topic> selectedTopics = new HashSet<>();
        if (request.getTopics() != null && !request.getTopics().isEmpty()) {
            for (String topicName : request.getTopics()) {
                topicRepository.findByName(topicName).ifPresent(selectedTopics::add);
            }
        }
        studyPlan.setTopics(selectedTopics);
        StudyPlan savedStudyPlan = studyPlanRepository.save(studyPlan);

        // Step 4: Generate the list of problems for the new plan
        List<Problem> problemPool = generateProblemPool(request, new ArrayList<>(selectedTopics));

        // Step 5: Create new daily tasks and ensure progress records exist for each problem
        List<DailyTask> dailyTasks = new ArrayList<>();
        int totalProblems = problemPool.size();
        for (int day = 1; day <= request.getDays(); day++) {
            int start = (int) Math.floor((double) totalProblems * (day - 1) / request.getDays());
            int end = (int) Math.floor((double) totalProblems * day / request.getDays());

            for (int i = start; i < end; i++) {
                Problem problem = problemPool.get(i);

                DailyTask task = new DailyTask();
                task.setStudyPlan(savedStudyPlan);
                task.setProblem(problem);
                task.setDayNumber(day);
                dailyTasks.add(task);

                // This logic ensures that a progress record exists for every problem in the plan.
                // If the user has seen this problem before, their progress is preserved.
                // If it's a new problem, a 'pending' record is created.
                progressRepository.findByUserIdAndProblemId(currentUser.getId(), problem.getId())
                        .orElseGet(() -> {
                            UserProblemProgress newProgress = new UserProblemProgress();
                            newProgress.setUser(currentUser);
                            newProgress.setProblem(problem);
                            newProgress.setStatus(UserProblemProgress.Status.pending);
                            return progressRepository.save(newProgress);
                        });
            }
        }

        dailyTaskRepository.saveAll(dailyTasks);

        // Step 6: Format the response DTO
        return formatPlanAsDto(dailyTasks, progressRepository.findAllByUserId(currentUser.getId()));
    }

    private List<Problem> generateProblemPool(StudyPlanRequest request, List<Topic> topics) {
        Map<Problem.Difficulty, Double> distribution = getDistribution(request.getLevel());
        int totalProblems = 3 * request.getDays(); // Aim for 3 problems per day

        List<Problem> easy, medium, hard;
        if (topics.isEmpty()) {
            easy = problemRepository.findByDifficulty(Problem.Difficulty.Easy);
            medium = problemRepository.findByDifficulty(Problem.Difficulty.Medium);
            hard = problemRepository.findByDifficulty(Problem.Difficulty.Hard);
        } else {
            easy = problemRepository.findByDifficultyAndTopicIn(Problem.Difficulty.Easy, topics);
            medium = problemRepository.findByDifficultyAndTopicIn(Problem.Difficulty.Medium, topics);
            hard = problemRepository.findByDifficultyAndTopicIn(Problem.Difficulty.Hard, topics);
        }

        Collections.shuffle(easy);
        Collections.shuffle(medium);
        Collections.shuffle(hard);

        List<Problem> finalPool = new ArrayList<>();
        finalPool.addAll(easy.subList(0, Math.min(easy.size(), (int) (totalProblems * distribution.get(Problem.Difficulty.Easy)))));
        finalPool.addAll(medium.subList(0, Math.min(medium.size(), (int) (totalProblems * distribution.get(Problem.Difficulty.Medium)))));
        finalPool.addAll(hard.subList(0, Math.min(hard.size(), (int) (totalProblems * distribution.get(Problem.Difficulty.Hard)))));

        Collections.shuffle(finalPool);
        return finalPool;
    }

    private List<DailyPlanDto> formatPlanAsDto(List<DailyTask> tasks, List<UserProblemProgress> progresses) {
        Map<Long, UserProblemProgress> progressMap = progresses.stream()
                .collect(Collectors.toMap(p -> p.getProblem().getId(), p -> p));

        Map<Integer, List<ProblemDto>> problemsByDay = tasks.stream()
                .collect(Collectors.groupingBy(
                        DailyTask::getDayNumber,
                        Collectors.mapping(task -> DtoMapper.toProblemDto(task.getProblem(), progressMap.get(task.getProblem().getId())), Collectors.toList())
                ));

        return problemsByDay.entrySet().stream()
                .map(entry -> {
                    DailyPlanDto dto = new DailyPlanDto();
                    dto.setDay(entry.getKey());
                    dto.setDate(LocalDate.now().plusDays(entry.getKey() - 1).format(DateTimeFormatter.ofPattern("E, MMM dd, yy")));
                    dto.setProblems(entry.getValue());
                    return dto;
                })
                .sorted(Comparator.comparingInt(DailyPlanDto::getDay))
                .collect(Collectors.toList());
    }

    private Map<Problem.Difficulty, Double> getDistribution(StudyPlan.SkillLevel level) {
        return switch (level) {
            case beginner -> Map.of(Problem.Difficulty.Easy, 0.60, Problem.Difficulty.Medium, 0.30, Problem.Difficulty.Hard, 0.10);
            case intermediate -> Map.of(Problem.Difficulty.Easy, 0.25, Problem.Difficulty.Medium, 0.50, Problem.Difficulty.Hard, 0.25);
            case pro -> Map.of(Problem.Difficulty.Easy, 0.10, Problem.Difficulty.Medium, 0.30, Problem.Difficulty.Hard, 0.60);
        };
    }
}
