class RdbDashboardsController < ::ApplicationController
  unloadable
  before_filter :board, only: [:show, :update, :destroy]
  respond_to :html

  def index
    sources = RdbSource.where context_id: context.id,
                              context_type: context.class

    if sources.any?
      redirect_to rdb_url sources.first.board
    else
      create
    end
  end

  def create
    ActiveRecord::Base.transaction do
      board = RdbBoard.create \
        name:   I18n.t('rdb.new.default_board_name', count: 0),
        engine: Rdb::Taskboard

      unless board.valid?
        board.name = I18n.t('rdb.new.default_board_name',
          count: RdbBoard.last.id + 1)
        board.save!
      end

      RdbSource.create! context: context, board: board

      Rails.logger.warn board.inspect

      redirect_to rdb_url board
    end
  end

  def show
  end

  def update
    if !(err = @board.engine.update(params)).eql?(true) # Error hash
      render status: 422, json: {errors: err}
    else
      render json: @board
    end
  end

  def context
    board.sources.first.context
  end

  private

  def board
    @board ||= RdbBoard.find(params[:id]).tap do |board|
      @engine = board.engine

      if board.sources.count == 1 && board.sources.first.context.is_a?(Project)
        @project = board.sources.first.context
        self.class.menu_item :rdb_project_dashboards
      end
    end
  end
end